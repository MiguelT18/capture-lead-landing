import { useState } from "react";
import Modal from "./Modal";
import { useForm } from "react-hook-form"
import axios from "axios"

export default function Form({ children }: any) {
  const [open, setOpen] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register: registerBasic,
    handleSubmit: handleSubmitBasic,
    formState: { errors: errorsBasic },
    reset: resetBasic,
  } = useForm();

  const {
    register: registerOpinion,
    handleSubmit: handleSubmitOpinion,
    formState: { errors: errorsOpinion },
    reset: resetOpinion,
  } = useForm();

  const onSubmitBasic = async (data: any) => {
    try {
      setLoading(true);

      console.log('🧾 Payload que se enviará:', { data });

      const res = await axios.post("/api/users", {
        ...data,
        opinion: "",
      })

      const result = res.data;
      setCreatedId(result._id)

      if (!result) {
        console.error("Error al crear el usuario:", result);
        return;
      }

      try {
        await axios.post("/api/brevo/addContact", {
          email: data.email,
          firstName: data.name.split(' ')[0],
          lastName: data.name.split(' ').slice(1).join(' '),
        })
      } catch (err) {
        console.error("Error al agregar el contacto a Brevo:", err);
        return;
      }

      setLoading(false);
      resetBasic();
      setOpen(true);
      document.body.style.overflow = "hidden";
    } catch (err) {
      console.error("Error al crear el hash:", err);
    }
  };

  const onSubmitOpinion = async (data: any) => {
    if (!createdId) return;

    try {
      setLoading(true);

      await axios.patch(`/api/users/${createdId}`, {
        opinion: data.opinion,
      });

      resetOpinion();
      setOpen(false);
      document.body.style.overflow = "auto";

      setLoading(false);

      window.location.href = "https://t.me/+fFUlQFLssnFjMzBh"
    } catch (err) {
      console.error("Error al actualizar la opinión:", err);
    }

  };

  const handleCloseModal = () => {
    setOpen(false);
    document.body.style.overflow = "auto";
    window.location.href = "https://t.me/+fFUlQFLssnFjMzBh"
  };

  return (
    <>
      {/* Aquí se puede mostrar el modal si 'open' es true */}
      <Modal isOpen={open} onClose={handleCloseModal}>
        <form onSubmit={handleSubmitOpinion(onSubmitOpinion)}>
          <h3 className="text-xl text-center text-white font-semibold mb-2">¿Qué te motivó a aprender programación?</h3>
          <p className="text-sm text-gray-400 mb-1">
            Tu opinión es muy importante para nosotros. Por favor, compártela con nosotros y ayúdanos a mejorar.
          </p>
          <label htmlFor="opinion" className="text-gray-300 block mb-1">Exprésate todo lo que quieras aquí</label>
          <div className="mb-4 mt-1">
            <textarea
              {...registerOpinion("opinion", { required: "Tu opinión no puede ir vacia" })}
              className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#0088cc] transition-colors outline-none rounded-sm w-full p-2 resize-none"
              autoComplete="off"
              rows={8}
              maxLength={255}
              placeholder="(max. 255 caracteres)"
            ></textarea>
            {errorsOpinion.opinion && (
              <span className="text-red-500 text-sm">{errorsOpinion.opinion?.message?.toString()}</span>
            )}
          </div>

          <div className="flex justify-between gap-2 [&>button]:w-full [&>button]:font-semibold [&>button]:py-2 [&>button]:text-md [&>button]:transition-all [&>button]:duration-300 [&>button]:rounded-sm [&>button]:cursor-pointer">
            <button onClick={handleCloseModal} className="bg-white text-black hover:bg-gray-300">Omitir</button>
            <button className="bg-[#0088cc] text-white hover:bg-[#0077b5]">{loading ? "Enviando..." : "Enviar"}</button>
          </div>
        </form>
      </Modal>

      <form onSubmit={handleSubmitBasic(onSubmitBasic)}>
        <h2 className="text-2xl font-bold text-white mb-6 max-md:text-center">
          Únete a nuestro grupo de Telegram
        </h2>

        <label htmlFor="name" className="text-gray-300">Nombre completo</label>
        <div className="mb-4 mt-1">
          <input
            {...registerBasic("name", { required: "El nombre completo es obligatorio" })}
            type="text"
            className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#0088cc] transition-colors outline-none rounded-sm w-full p-2"
            autoComplete="off"
            placeholder="Nombre completo"
          />
          {errorsBasic.name && <span className="text-red-500 text-sm">{errorsBasic.name?.message?.toString()}</span>}
        </div>

        <label htmlFor="email" className="text-gray-300">Correo electrónico</label>
        <div className="mb-6 mt-1">
          <input
            {...registerBasic("email", {
              required: "El correo electrónico es obligatorio",
              pattern: {
                value: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
                message: "Correo inválido",
              },
            })}
            type="text"
            className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#0088cc] transition-colors outline-none rounded-sm w-full p-2"
            autoComplete="off"
            placeholder="Correo electrónico"
          />
          {errorsBasic.email && <span className="text-red-500 text-sm">{errorsBasic.email?.message?.toString()}</span>}
        </div>

        <button
          className="w-full bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold py-2 text-md lg:text-lg transition-all duration-300 rounded-sm cursor-pointer flex items-center justify-center"
          type="submit"
        >
          {children}
          {loading ? "Enviando..." : "Unirme a Telegram"}
        </button>
      </form>
    </>
  );
}
