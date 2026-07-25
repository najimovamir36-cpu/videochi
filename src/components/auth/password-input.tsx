"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { forwardRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input, type InputProps } from "@/components/ui/input";

/** Password field with a reveal toggle and a lock affordance. */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  ({ ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        startIcon={<Lock />}
        endAdornment={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            tabIndex={-1}
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible((current) => !current)}
            className="text-muted-foreground hover:text-foreground"
          >
            {visible ? <EyeOff /> : <Eye />}
          </Button>
        }
        {...props}
      />
    );
  },
);
PasswordInput.displayName = "PasswordInput";
