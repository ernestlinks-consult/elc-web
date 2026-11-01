import { forwardRef, type InputHTMLAttributes } from "react";

/**
 * Hidden from people and assistive technology, tempting to bots. Anything typed
 * here makes the server drop the submission without saying so (F-08).
 */
export const Honeypot = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Honeypot(props, ref) {
  return (
    <div aria-hidden="true" className="sr-only">
      <label>
        Website
        <input
          {...props}
          ref={ref}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
    </div>
  );
});
