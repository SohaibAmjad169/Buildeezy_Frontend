import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Box, useTheme } from "@mui/material";
import "react-quill/dist/quill.snow.css";
import { colors } from "../../styles/theme";
import ReactQuill from "react-quill";

const DescriptionWithQuill = forwardRef(
  (
    { value = "", onChange, placeholder, maxLength = 300, onCharCountChange },
    ref
  ) => {
    const quillRef = useRef(null);
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    // ✅ Internal editor state to avoid full re-render
    const [editorContent, setEditorContent] = useState(value);

    // ✅ Sync external value only if it changes from outside
    useEffect(() => {
      if (value !== editorContent) {
        setEditorContent(value);
      }
    }, [value]);

    // ✅ Expose methods to parent
    useImperativeHandle(ref, () => ({
      getEditor: () => quillRef.current?.getEditor(),
      focus: () => quillRef.current?.focus(),
      blur: () => quillRef.current?.blur(),
    }));

    // ✅ Handle input change with caret preservation
    // const handleChange = useCallback(
    //   (content, delta, source, editor) => {
    //     if (source !== "user") return;

    //     const plain = editor.getText().trimEnd(); // Includes \n at end
    //     if (maxLength && plain.length > maxLength) return;

    //     const selection = editor.getSelection();

    //     setEditorContent(content);
    //     onChange?.(content);

    //     // ✅ Restore caret
    //     setTimeout(() => {
    //       if (selection) {
    //         editor.setSelection(selection.index, selection.length);
    //       }
    //     }, 0);
    //   },
    //   [maxLength, onChange]
    // );

    const handleChange = useCallback(
      (content, delta, source) => {
        if (source !== "user") return;

        const quill = quillRef.current?.getEditor();
        const plain = quill?.getText()?.trimEnd() || "";

        if (maxLength && plain.length > maxLength) return;

        onCharCountChange?.(plain.length);
        setEditorContent(content);
        onChange?.(content);
      },
      [maxLength, onChange, onCharCountChange]
    );

    const modules = {
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    };

    const formats = [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "bullet",
      "link",
    ];

    return (
      <Box
        sx={{
          "& .ql-container": {
            borderBottomLeftRadius: "8px",
            borderBottomRightRadius: "8px",
            backgroundColor: isDarkMode ? "#333" : colors.white,
            color: isDarkMode ? colors.grey100 : colors.grey900,
            border: `1px solid ${colors.grey300}`,
            borderTop: "none",
            fontFamily: "inherit",
            height: "200px",
          },
          "& .ql-editor": {
            minHeight: "180px",
            fontSize: "14px",
            lineHeight: "1.5",
            padding: "12px",
            whiteSpace: "pre-wrap",
            color: isDarkMode ? colors.grey100 : colors.grey900,
            "&.ql-blank::before": {
              color: colors.grey300,
              fontStyle: "normal",
              fontSize: "14px",
              fontFamily: "inherit",
              whiteSpace: "pre-wrap",
              content: `"${placeholder}"`,
            },
          },
          "& .ql-toolbar": {
            border: `1px solid ${colors.grey300}`,
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            padding: "8px",
            backgroundColor: isDarkMode ? "#333" : colors.white,
            "& .ql-formats": {
              marginRight: "8px",
            },
            "& .ql-stroke": {
              stroke: `${colors.grey300} !important`,
            },
            "& .ql-fill": {
              fill: `${colors.grey300} !important`,
            },
            "& .ql-picker": {
              color: isDarkMode ? colors.white : colors.grey300,
              "&-label": {
                color: `${colors.grey300} !important`,
                "&:hover": {
                  color: `${colors.grey500} !important`,
                },
              },
              "&-options": {
                backgroundColor: `${colors.white} !important`,
                "& .ql-picker-item": {
                  color: `${colors.grey300} !important`,
                  "&:hover": {
                    color: `${colors.grey500} !important`,
                  },
                },
              },
            },
            "& button:hover .ql-stroke": {
              stroke: `${colors.grey500} !important`,
            },
            "& button:hover .ql-fill": {
              fill: `${colors.grey500} !important`,
            },
            "& button.ql-active .ql-stroke": {
              stroke: `${colors.grey500} !important`,
            },
            "& button.ql-active .ql-fill": {
              fill: `${colors.grey500} !important`,
            },
            "& .ql-picker.ql-expanded": {
              "& .ql-picker-label": {
                color: `${colors.grey500} !important`,
                "& .ql-stroke": {
                  stroke: `${colors.grey500} !important`,
                },
              },
              "& .ql-picker-options": {
                border: `1px solid ${colors.grey300} !important`,
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              },
            },
            "& button": {
              padding: "2px 4px",
              color: isDarkMode ? colors.grey200 : colors.grey700,
            },
          },
        }}
      >
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={editorContent}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          bounds="self"
          preserveWhitespace
        />
      </Box>
    );
  }
);

DescriptionWithQuill.displayName = "DescriptionWithQuill";
export default DescriptionWithQuill;
