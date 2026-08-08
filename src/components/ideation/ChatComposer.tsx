"use client";

import { useState, type KeyboardEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatComposer({
  onSend,
  sending,
  placeholder,
}: {
  onSend: (message: string) => void | Promise<void>;
  sending: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  const handleSend = async () => {
    if (!value.trim() || sending) return;
    const message = value;
    setValue("");
    await onSend(message);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "메시지를 입력하세요 (Shift+Enter로 줄바꿈)"}
        rows={2}
        className="flex-1 resize-none"
        disabled={sending}
      />
      <Button onClick={handleSend} disabled={sending || !value.trim()} size="icon" className="size-10 shrink-0">
        {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
      </Button>
    </div>
  );
}
