import { useMediaQuery, useTheme } from "@mui/material";

const LargerThanXs = () => useMediaQuery(useTheme().breakpoints.up(400));
const LargerThanSm = () => useMediaQuery(useTheme().breakpoints.up("sm"));
const LargerThanMd = () => useMediaQuery(useTheme().breakpoints.up("md"));
const LargerThanLg = () => useMediaQuery(useTheme().breakpoints.up("lg"));

export { LargerThanXs, LargerThanSm, LargerThanMd, LargerThanLg };