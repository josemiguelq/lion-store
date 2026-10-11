import { BRAND } from "@/lib/brand";

export default function Expired() {
  return (
    <div className="expired-root">
      <div className="card">
        <div className="icon">⏳</div>
        <h1>O tempo acabou</h1>
        <p>
          O prazo para concluir sua compra por este link expirou ou o link é
          inválido. Entre em contato com o vendedor para receber um novo link.
        </p>
      </div>
    </div>
  );
}
