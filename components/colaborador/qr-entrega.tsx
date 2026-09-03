import QRCode from "qrcode";

/**
 * Código QR del código de entrega, generado en el servidor (sin conexión, sin
 * llamadas externas). Se pinta en negro sobre blanco para que se lea siempre,
 * sin depender del tema. Lo escanea el módulo de entrega en la jornada.
 */
export async function QrEntrega({ value }: { value: string }) {
  const svg = await QRCode.toString(value, {
    type: "svg",
    margin: 1,
    width: 192,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });

  return (
    <div
      role="img"
      aria-label={`Código QR de entrega ${value}`}
      className="inline-block rounded-lg bg-white p-3 shadow-sm [&>svg]:block"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
