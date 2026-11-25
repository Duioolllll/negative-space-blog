import { useId, useState, type FormEvent } from "react";
import { subscribe } from "../../lib/api/subscribe.functions";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done"; already: boolean }
  | { kind: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Letters() {
  const inputId = useId();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus({ kind: "error", message: "이메일 주소를 다시 확인해 주세요." });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await subscribe({ data: { email: value } });
      if (!res.ok) {
        setStatus({ kind: "error", message: "지금은 구독을 받을 수 없어요. 잠시 뒤에 다시 시도해 주세요." });
        return;
      }
      setStatus({ kind: "done", already: res.already });
    } catch {
      setStatus({ kind: "error", message: "전송에 실패했어요. 연결을 확인하고 다시 시도해 주세요." });
    }
  };

  const invalid = status.kind === "error";

  return (
    <section id="letters" className="ns-letters relative overflow-hidden" aria-labelledby="letters-title">
      <img src="/assets/safelight.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div className="ns-letters-dim absolute inset-0" aria-hidden="true" />
      <div className="relative flex min-h-[78vh] flex-col justify-end px-5 pt-40 pb-14 md:px-10 md:pb-20">
        <h2 id="letters-title" className="max-w-[16ch] text-4xl leading-[1.1] tracking-tight text-white md:text-6xl">
          새 글이 현상되면 알려드릴게요
        </h2>
        <p className="mt-5 max-w-[30rem] text-base leading-relaxed text-white/85">
          한 달에 두 번쯤, 새로 쓴 글 한 편과 짧은 메모를 보냅니다. 광고는 없어요.
        </p>

        <div className="mt-10 max-w-[34rem]">
          {status.kind === "done" ? (
            <p className="lg lg-clear ns-receipt inline-flex items-center gap-3 px-6 py-4 text-lg text-white" role="status">
              <span className="h-2.5 w-2.5 rounded-full bg-safelight" aria-hidden="true" />
              {status.already ? "이미 구독 중인 주소예요. 다음 글에서 만나요." : "구독했어요. 다음 글에서 만나요."}
            </p>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <label htmlFor={inputId} className="mb-3 block text-sm text-white">이메일</label>
              <div className="lg lg-clear lg-interactive ns-field">
                <input
                  id={inputId}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status.kind === "error") setStatus({ kind: "idle" });
                  }}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? errorId : undefined}
                  placeholder="you@example.com"
                  className="ns-field-input"
                />
                <button type="submit" disabled={status.kind === "sending"} className="ns-field-submit">
                  {status.kind === "sending" ? "보내는 중" : "구독하기"}
                </button>
              </div>
              {invalid && (
                <p id={errorId} className="ns-field-error mt-3 text-sm" role="alert">
                  {status.message}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
