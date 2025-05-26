import { useState, useEffect } from "react";
import Modal from "./Modal";
import { useForm } from "react-hook-form";
import axios from "axios";
import formatName from "@/utils/formatName";
import { getUTMParams, saveUTMToLocalStorage, getSavedUTMFromLocalStorage } from "@/utils/getUTMParams";
import { isEmbeddedBrowser } from "@/utils/scripts";

interface UtmUserProps {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

interface MongoUserDBProps {
  firstName: string;
  lastname: string;
  name: string;
  email: string;
  opinion: string;
  createdAd: Date;
  campaign: string;
  sentiment: boolean;
  utm: UtmUserProps;
  userAgent: string;
  ip: string;
  referrer: string;
  fromVersion: string;
  landingVersion: string;
}

export default function Form({ children }: any) {
  const [open, setOpen] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

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

  useEffect(() => {
    const utm = getUTMParams();
    const anyUtmExists = Object.values(utm).some(val => val !== null);
    const alreadySaved = localStorage.getItem("utm_params");
    if (anyUtmExists && !alreadySaved) {
      saveUTMToLocalStorage();
    }
  }, []);

  useEffect(() => {
    const embeddedBrowser = () => isEmbeddedBrowser();

    if (embeddedBrowser()) {
      setDisabled(true);

      window.dispatchEvent(new CustomEvent("show-notification", {
        detail: {
          type: "warning",
          message: "Ups, abre esto en tu navegador normal para unirte bien.",
        }
      }));

    }
  }, []);

  const onSubmitBasic = async (data: any, event: any) => {
    event?.preventDefault();
    try {
      setLoading(true);

      const utm = getSavedUTMFromLocalStorage();

      const res = await axios.post("/api/users", {
        name: formatName(data.name),
        lastName: formatName(data.lastName),
        email: data.email.trim(),
        opinion: "",
        utm,
        referrer: document.referrer || ""
      });

      const result = res.data;
      setCreatedId(result._id);

      // 💾 Guardar ID en localStorage
      localStorage.setItem("registeredUserId", result._id);

      // 🍪 Guardar cookie simple (cliente)
      document.cookie = `registeredUserID=${result._id}; path=/; max-age=31536000`; // 1 año

      try {
        await axios.post("/api/brevo/addContact", {
          firstName: formatName(data.name),
          lastName: formatName(data.lastName),
          email: data.email.trim(),
        });
      } catch (err: any) {
        setLoading(false);
        return new Response(
          "Error al agregar el contacto a Brevo",
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }

      window.dispatchEvent(
        new CustomEvent("show-notification", {
          detail: {
            type: "success",
            message: result.success,
          },
        })
      );

      setLoading(false);
      resetBasic();
      setOpen(true);
      document.body.style.overflow = "hidden";
    } catch (err: any) {
      setLoading(false);

      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response.data?.error || "";

        if (errorMessage === "El correo electrónico ya fue usado") {
          const existingId = err.response.data?._id;

          if (existingId) {
            localStorage.setItem("registeredUserId", existingId);
            document.cookie = `registeredUserID=${existingId}; path=/; max-age=31536000`;

            window.dispatchEvent(
              new CustomEvent("show-notification", {
                detail: {
                  type: "success",
                  message: "Ya estabas registrado, ¡te redirigimos al canal! 🚀",
                },
              })
            );

            setTimeout(() => {
              window.location.href = "https://t.me/+fFUlQFLssnFjMzBh";
            }, 3000);

            return;
          }
        }

        window.dispatchEvent(
          new CustomEvent("show-notification", {
            detail: {
              type: "warning",
              message: errorMessage,
            },
          })
        );
      } else {
        console.error("Error desconocido:", err);
      }
    }
  };

  const onSubmitOpinion = async (data: any) => {
    if (!createdId) return;

    try {
      setLoading(true);

      await axios.patch(`/api/users/${createdId}`, {
        opinion: data.opinion,
      });

      window.dispatchEvent(
        new CustomEvent("show-notification", {
          detail: {
            type: "success",
            message: "¡Gracias por tu opinión!",
          },
        })
      );

      resetOpinion();
      setOpen(false);
      document.body.style.overflow = "auto";

      setLoading(false);

      window.location.href = "https://t.me/+fFUlQFLssnFjMzBh";
    } catch (err: any) {
      setLoading(false);
      if (axios.isAxiosError(err) && err.response) {
        window.dispatchEvent(
          new CustomEvent("show-notification", {
            detail: {
              type: "error",
              message: err.response.data.error,
            },
          })
        );
      } else {
        console.error("Error desconocido:", err);
      }
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    document.body.style.overflow = "auto";
    window.location.href = "https://t.me/+fFUlQFLssnFjMzBh";
  };

  return (
    <>
      <Modal isOpen={open} onClose={handleCloseModal}>
        <form onSubmit={handleSubmitOpinion(onSubmitOpinion)}>
          <h3 className="mb-2 text-xl font-semibold text-center text-white">¿Qué te motivó a aprender programación?</h3>
          <p className="mb-1 text-gray-400 max-md:text-sm text-md">
            Tu opinión es muy importante, me gustaría saber qué fue lo que te motivó a aprender programación
          </p>
          <label htmlFor="opinion" className="block mb-1 text-gray-300">Exprésate todo lo que quieras aquí</label>
          <div className="mt-1 mb-4">
            <textarea
              {...registerOpinion("opinion", { required: "Tu opinión no puede ir vacia" })}
              onKeyDown={(e) => {
                if ((e.key === "Enter" && (e.ctrlKey || e.metaKey)) && !loading) {
                  handleSubmitOpinion(onSubmitOpinion)();
                }
              }}
              className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#0088cc] transition-colors outline-none rounded-sm w-full p-2 resize-none"
              autoComplete="off"
              rows={8}
              maxLength={255}
              placeholder="(max. 255 caracteres)"
            ></textarea>
            {errorsOpinion.opinion && (
              <span className="text-sm text-red-500">{errorsOpinion.opinion?.message?.toString()}</span>
            )}
          </div>

          <div className="flex justify-between gap-2 [&>button]:w-full [&>button]:font-semibold [&>button]:py-2 [&>button]:text-md [&>button]:transition-all [&>button]:duration-300 [&>button]:rounded-sm [&>button]:cursor-pointer">
            <button onClick={handleCloseModal} className="text-black bg-white hover:bg-gray-300">Omitir</button>
            <button className="bg-[#0088cc] text-white hover:bg-[#0077b5]">{loading ? "Enviando..." : "Enviar"}</button>
          </div>
        </form>
      </Modal>

      <form onSubmit={handleSubmitBasic(onSubmitBasic)}>
        <h2 className="mb-4 text-2xl font-bold text-white max-md:text-center">
          Únete a nuestro grupo de Telegram
        </h2>

        <div className="mt-1 mb-4">
          <label htmlFor="name" className="text-gray-300">Nombres</label>
          <input
            {...registerBasic(
              "name",
              {
                required: "Tus nombres son obligatorios",
                pattern: {
                  value: /^[\p{L}\s]+$/u,
                  message: "Solo se permiten letras"
                }
              })}
            type="text"
            className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#0088cc] transition-colors outline-none rounded-sm w-full p-2"
            autoComplete="off"
            placeholder="Nombres"
          />
          {errorsBasic.name && <span className="text-sm text-red-500">{errorsBasic.name?.message?.toString()}</span>}
        </div>

        <label htmlFor="name" className="text-gray-300">Apellidos</label>
        <div className="mt-1 mb-4">
          <input
            {...registerBasic(
              "lastName",
              {
                required: "Tus apellidos son obligatorios",
                pattern: {
                  value: /^[\p{L}\s]+$/u,
                  message: "Solo se permiten letras"
                }
              })}
            type="text"
            className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#0088cc] transition-colors outline-none rounded-sm w-full p-2"
            autoComplete="off"
            placeholder="Apellidos"
          />
          {errorsBasic.lastName && <span className="text-sm text-red-500">{errorsBasic.lastName?.message?.toString()}</span>}
        </div>

        <label htmlFor="email" className="text-gray-300">Correo electrónico</label>
        <div className="mt-1 mb-6">
          <input
            {...registerBasic("email", {
              required: "El correo electrónico es obligatorio",
              pattern: {
                value: /^[^\s@]+(\.[^\s@]+)*@[^\s@]+\.[a-zA-Z]{2,7}$/,
                message: "Correo inválido",
              },
            })}
            type="text"
            className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#0088cc] transition-colors outline-none rounded-sm w-full p-2"
            autoComplete="off"
            placeholder="Correo electrónico"
          />
          {errorsBasic.email && <span className="text-sm text-red-500">{errorsBasic.email?.message?.toString()}</span>}
        </div>

        <button
          disabled={disabled || loading}
          className="w-full bg-[#0088cc] disabled:bg-[#006da5] disabled:text-[#c4c4c4] disabled:cursor-not-allowed hover:bg-[#0077b5] text-white font-bold py-2 text-md lg:text-lg transition-all duration-300 rounded-sm cursor-pointer flex items-center justify-center"
          type="submit"
        >
          {children}
          {loading ? "Enviando..." : disabled ? "No disponible" : "Unirme al grupo"}
        </button>

        {
          disabled && (
            <div className="mt-4">
              <p className="text-red-500 text-sm">
                No puedes unirte al grupo desde un navegador embebido. Por favor, abre la página en tu navegador.
              </p>
            </div>
          )
        }
      </form>
    </>
  );
}