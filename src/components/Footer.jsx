import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="text-xl font-black">
              KICK<span className="text-violet-600">STORE</span>
            </Link>
            <p className="text-sm text-zinc-500 mt-3">
              Votre destination sneakers depuis 2015. Authenticité garantie.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Aide</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-zinc-900">FAQ</a></li>
              <li><a href="#" className="hover:text-zinc-900">Livraison</a></li>
              <li><a href="#" className="hover:text-zinc-900">Retours</a></li>
              <li><a href="#" className="hover:text-zinc-900">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-zinc-900">CGV</a></li>
              <li><a href="#" className="hover:text-zinc-900">Mentions légales</a></li>
              <li><a href="#" className="hover:text-zinc-900">Confidentialité</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Paiement sécurisé</h4>
            <div className="flex gap-2">
              <div className="w-12 h-8 bg-zinc-100 rounded flex items-center justify-center text-xs font-bold">
                VISA
              </div>
              <div className="w-12 h-8 bg-zinc-100 rounded flex items-center justify-center text-xs font-bold">
                MC
              </div>
              <div className="w-12 h-8 bg-zinc-100 rounded flex items-center justify-center text-xs font-bold">
                PP
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} KickStore. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
