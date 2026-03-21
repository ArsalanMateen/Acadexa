import styles from "./Badge.module.css";

const variantClassNames = {
  "variant-default": "variantDefault",
  "variant-primary": "variantPrimary",
  "variant-success": "variantSuccess",
  "variant-warning": "variantWarning",
  "variant-danger": "variantDanger",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
  ...props
}) {
  const classes = [
    styles.badge,
    styles[variantClassNames[`variant-${variant}`]],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
