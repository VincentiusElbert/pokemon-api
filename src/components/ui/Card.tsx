import React from "react";
import { Link } from "react-router-dom";

type CardProps = {
  name: string;
  image: string;
  types: string[];
  id: number;
};

const Card: React.FC<CardProps> = ({ name, image, types, id }) => {
  // Format ID: pad with zeros (e.g., 001, 042)
  const formattedId = id.toString().padStart(3, "0");

  return (
    <Link to={`/pokemon/${name}`} className="no-underline">
      <div className="bg-neutral-25 border border-neutral-200 rounded-2xl shadow-sm w-[361px] md:max-w-[288px] transition hover:shadow-md hover:scale-105 duration-300">
        {/* image */}
        <div className="relative">
          {/* Background Pokéball circle */}

          <div className="absolute inset-0 flex justify-center items-center opacity-20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-50 h-50 fill-current text-gray-300">
              <path d="M21.95 11h-3.021A6.988 6.988 0 0012 6a6.988 6.988 0 00-6.929 5H2.05a10.005 10.005 0 0119.9 0zM2.05 13h3.021A6.988 6.988 0 0012 18a6.988 6.988 0 006.929-5h3.021a10.005 10.005 0 01-19.9 0zM12 9a3 3 0 100 6 3 3 0 000-6z" />
            </svg>
          </div>

          <img src={image} alt={name} className="relative z-10 w-50 h-50 mx-auto object-contain" />
        </div>
        {/* info pokemon */}
        <div className="p-6 justify-start flex flex-col items-start gap-4">
          <p className="text-sm md:text-md text-neutral-500">{formattedId}</p>
          <h2 className="font-bold capitalize  text-neutral-900 text-md md:text-xl">{name}</h2>

          <div className=" flex justify-center items-center flex-wrap text-center gap-2">
            {types.map((type) => (
              <span key={type} className="bg-white h-8  capitalize border-neutral-300 text-neutral-900 text-sm px-3 items-center text-center flex rounded-md font-bold border-2">
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;
