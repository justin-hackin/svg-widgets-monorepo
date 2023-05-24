import React, { forwardRef, useRef } from 'react';

export const InvisibleTextFileInput = forwardRef<
HTMLInputElement, { changeHandler:(txt: string, path?: string) => void, accept: string }
>(({
    changeHandler,
    accept,
  }, ref) => {
    const formRef = useRef<HTMLFormElement>(null);

    return (
      <form ref={formRef}>
        <input
          ref={ref}
          onChange={async (e) => {
            const widgetFile = e.target?.files?.[0];
            if (!widgetFile) {
              return;
            }
            const widgetJSONTxt = await widgetFile.text();
            formRef?.current?.reset();
            changeHandler(widgetJSONTxt, widgetFile.name);
          }}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
        />
      </form>
    );
  });
