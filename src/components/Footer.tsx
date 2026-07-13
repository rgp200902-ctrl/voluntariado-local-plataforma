import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Plataforma de Voluntariado Local</h3>
            <p className="text-gray-400 text-sm">
              Conectando instituições locais com voluntários disponíveis para ações de interesse comunitário.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/oportunidades" className="text-gray-400 hover:text-white text-sm">
                  Oportunidades
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-gray-400 hover:text-white text-sm">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-400 hover:text-white text-sm">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <p className="text-gray-400 text-sm">
              Email: info@voluntariadolocal.pt
            </p>
            <p className="text-gray-400 text-sm">
              Telefone: +351 XXX XXX XXX
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Plataforma de Voluntariado Local. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
