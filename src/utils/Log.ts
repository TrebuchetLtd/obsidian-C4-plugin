import { Notice } from "obsidian";
import { JudgerError } from "./Error";

export function log_update(msg: string): void {
  const notice = new Notice("", 15000);
  // TODO: Find better way for this
  // @ts-ignore
  notice.noticeEl.innerHTML = `<b>Judger update</b>:<br/>${msg}`;
}

export function log_error(e: Error | JudgerError): void {
  const notice = new Notice("", 8000);
  if (e instanceof JudgerError && e.console_msg) {
    // TODO: Find a better way for this
    // @ts-ignore
    notice.noticeEl.innerHTML = `<b>Judger Error</b>:<br/>${e.message}<br/>Check console for more information`;
    console.error(`Judger Error:`, e.message, "\n", e.console_msg);
  } else {
    // @ts-ignore
    notice.noticeEl.innerHTML = `<b>Judger Error</b>:<br/>${e.message}`;
  }
}
