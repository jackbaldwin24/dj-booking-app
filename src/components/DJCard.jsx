import React from "react";
import {
  FaLink,
} from "react-icons/fa";

export default function DJCard({ dj, onBook }) {
  if (!dj) return null;

  return (
    <div className="card">
      <div className="flex items-center gap-4 mb-3">
        {dj.profilePicUrl && (
          <img
            src={dj.profilePicUrl}
            alt={`${dj.name || "DJ"}'s profile`}
            className="w-14 h-14 rounded-full object-cover ring-1 ring-white/10"
          />
        )}
        <div>
          <h2 className="text-lg font-semibold leading-tight">{dj.name || "Unnamed DJ"}</h2>
          {Array.isArray(dj.genre) && dj.genre.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {dj.genre.map((g) => (
                <span key={g} className="badge">{g}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {dj.bio && <p className="text-sm text-gray-200 mb-3">{dj.bio}</p>}

      {dj.email && (
        <p className="mb-2 text-xs text-gray-400">
          <strong>Email:</strong> {dj.email}
        </p>
      )}

      {Array.isArray(dj.cities) && dj.cities.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {dj.cities.map((city, idx) => (
            <span key={idx} className="badge">{city}</span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-gray-400">No cities listed</p>
      )}

      <div className="flex items-center gap-3 mt-3">
        {dj.socials?.website && (
          <a href={dj.socials.website} target="_blank" rel="noopener noreferrer">
            <FaLink className="w-5 h-5 opacity-80 hover:opacity-100" />
          </a>
        )}
      </div>

      {(onBook || dj.epkUrl) && (
        <div className="mt-4 flex justify-start gap-2">
          {dj.epkUrl && (
            <a
              href={dj.epkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              View EPK
            </a>
          )}
          {onBook && (
            <button
              onClick={() => onBook && onBook(dj.id)}
              className="btn bg-green-600 hover:bg-green-700 text-white"
            >
              Book DJ
            </button>
          )}
        </div>
      )}
    </div>
  );
}