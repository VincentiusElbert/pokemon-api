import logo from "../assets/logo-pokemon.svg";

const Footer = () => {
  return (
    <div className="flex flex-col gap-2 p-4 bg-white border border-t-neutral-300 ">
      <div className="px-35 py-10 flex items-center justify-start gap-2">
        <img src={logo} alt="" width={33} height={33} />
        <p className="text-neutral-900 font-bold text-[19px] md:text-[28px]">Pokedex</p>
        <p className="text-neutral-600 text-xs md:text-md">Copyright &copy; 2025 Pokedex</p>
      </div>
    </div>
  );
};
export default Footer;
