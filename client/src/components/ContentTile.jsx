function ContentTile({
  item,
  className = "",
  children,
  slotIndex,
  size = "lg",
}) {
  const width =
    size === "sm" ? "w-[140px]" : size === "fluid" ? "w-full" : "w-[218px]";
  const textSize = size === "sm" ? "text-[0.6rem]" : "text-[0.7rem]";

  return (
    <div
      className={`relative group cursor-pointer ${width} rounded-[10px] overflow-hidden bg-bg-panel shadow-[0_1px_2px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.06)] ${className}`}
    >
      <div className="relative aspect-video bg-[#201e1e] flex items-center justify-center">
        {item.type === "app" ? (
          <span className="text-text-muted text-sm">App</span>
        ) : (
          <img
            src={item.mediaUrl}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}

        {item.durationInMillis && (
          <span className="absolute right-1.5 bottom-1.5 bg-black/78 text-white text-[10.5px] font-semibold px-1.5 py-0.5 rounded-[5px] leading-[15px] min-h-[15px]">
            {item.durationInMillis / 1000}s
          </span>
        )}

        {children}
      </div>

      <div className="flex flex-col gap-1.5 px-2.5 pt-2 pb-2.5">
        <p
          className={`font-bold ${textSize} leading-[1.35] text-text-primary whitespace-nowrap overflow-hidden text-ellipsis`}
        >
          {item.name}
        </p>
        <span className="inline-flex items-center justify-center w-fit text-[10px] font-bold px-[6px] py-[2px] rounded-[5px] text-[rgb(214,220,227)] bg-[rgb(39,45,55)]">
          {item.type.toUpperCase()}
        </span>

        {slotIndex !== undefined && (
          <p className="font-bold text-[0.7rem] text-text-primary">
            #{slotIndex + 1} {item.name}
          </p>
        )}
      </div>
    </div>
  );
}

export default ContentTile;
