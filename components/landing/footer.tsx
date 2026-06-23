export function Footer() {
  return (
    <footer>
      <div className="relative bg-[#54B16C] overflow-hidden min-h-[450px]">
        {/* Single line: copyright left, socials right */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-sm text-white/80">
          <p>&copy; {new Date().getFullYear()} Trove. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="hover:text-white transition-colors"
              aria-label="Twitter"
            >
              X
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors"
              aria-label="GitHub"
            >
              GH
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              LI
            </a>
          </div>
        </div>

        {/* Giant cropped logo */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[55%] w-full max-w-[80vw] pointer-events-none select-none">
          <img
            src="/logo.svg"
            alt=""
            className="w-full h-auto"
            aria-hidden="true"
          />
        </div>
      </div>
    </footer>
  );
}
