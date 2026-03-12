import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-primary)] mt-auto">
      <Container className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--color-text-tertiary)]">APEX</span>
          <span className="text-xs text-[var(--color-text-muted)]">
            한국 F1 데이터 플랫폼
          </span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          Data: OpenF1 API &middot; Jolpica-F1 API
        </p>
      </Container>
    </footer>
  );
}
