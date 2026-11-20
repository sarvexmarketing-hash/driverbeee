import React from "react";
import { SignIn1 } from "@/components/ui/modern-stunning-sign-in";
import { Button } from "@/components/ui/moving-border";

export function MovingBorderDemo() {
  return (
    <div>
      <Button
        borderRadius="1.75rem"
        className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800"
      >
        Borders are cool
      </Button>
    </div>
  );
}

function Demo() {
  return <SignIn1 />;
}

export { Demo };
export default Demo;
