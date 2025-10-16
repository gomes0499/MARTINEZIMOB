import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-8 p-8">
      <div className="flex flex-col items-center">
        <div className="bg-black px-8 py-6 rounded-lg mb-8">
          <Image
            src="/martinez-logo-black.svg"
            alt="Martinez Negócios Imobiliários"
            width={200}
            height={56}
            className="w-full h-auto"
            priority
          />
        </div>
        <h2 className="text-2xl font-bold text-center">
          Bem-vindo de volta
        </h2>
        <p className="text-muted-foreground text-center mt-2">
          Entre com suas credenciais para acessar o sistema
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
