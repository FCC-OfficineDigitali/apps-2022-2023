import { useMediaQuery, useTheme } from "@mui/material";

const LargerThanSm = _ => useMediaQuery(useTheme().breakpoints.up("sm"));
const LargerThanLg = _ => useMediaQuery(useTheme().breakpoints.up("lg"));

export { LargerThanSm, LargerThanLg };