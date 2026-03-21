import styles from "./Button.module.css";

const variantClassNames = {
  "variant-primary": "variantPrimary",
  "variant-outline": "variantOutline",
  "variant-secondary": "variantSecondary",
  "variant-ghost": "variantGhost",
  "variant-danger": "variantDanger",
};

const sizeClassNames = {
  "size-sm": "sizeSmall",
  "size-md": "sizeMedium",
  "size-lg": "sizeLarge",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled = false,
  loading = false,
  type = "button",
  onClick,
  ...props
}) {
  const classes = [
    styles.button,
    styles[variantClassNames[`variant-${variant}`]],
    styles[sizeClassNames[`size-${size}`]],
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
