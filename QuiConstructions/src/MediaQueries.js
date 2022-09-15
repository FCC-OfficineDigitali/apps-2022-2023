import { useMediaQuery, useTheme } from "@mui/material";

const LargerThanSm = () => useMediaQuery(useTheme().breakpoints.up("sm"));
const LargerThanLg = () => useMediaQuery(useTheme().breakpoints.up("lg"));

export { LargerThanSm, LargerThanLg };