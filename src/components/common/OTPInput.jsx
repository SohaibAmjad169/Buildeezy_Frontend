import React, { useState, useRef } from "react";
import { TextField, Grid } from "@mui/material";

const OTPInput = ({ length = 6, onChange }) => {
  const [otp, setOTP] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    let value = e.target.value;
    if (isNaN(value)) {
      return;
    }
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);

    // Join all the OTP digits and pass it to parent onChange callback
    onChange(newOTP.join(""));

    // Focus on the next input box if there is value
    if (value !== "" && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Focus on the previous input box on backspace
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text/plain")
      .trim()
      .slice(0, length);

    const newOTP = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOTP[i] = pasteData[i];
    }
    setOTP(newOTP);
    onChange(newOTP.join(""));
  };

  return (
    <Grid container spacing={1}>
      {Array.from({ length }).map((_, index) => (
        <Grid item key={index}>
          <TextField
            inputRef={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            variant="outlined"
            value={otp[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            autoFocus={index === 0}
            sx={{
              "& .MuiInputBase-root": {
                width: { xs: 30, md: 38 },
                height: { xs: 30, md: 38 },
              },
              "& .MuiInputBase-input": {
                padding: { xs: "16.5px 10px", md: "16.5px 14px" },
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderRadius: "6px !important",
              },
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default OTPInput;
