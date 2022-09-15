import React from "react";
import { Button, Icon } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useSnackbar } from "notistack";
import ipPortApi from "../ipPortApi";
import { LargerThanSm } from "../MediaQueries";
import Axios from "axios";

export default function FileDownloadButtonComp(props) {
    const { enqueueSnackbar } = useSnackbar();
    const sm = LargerThanSm();

    return (
        <>
            <Button
                variant="contained"
                color="secondary"
                onClick={_ =>
                    Axios.get(ipPortApi + "downloadCsv/" + props.fileName)
                        .then(response => {
                            if (response && response.data.message)
                                enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" });
                            else {
                                enqueueSnackbar("Download del file avviato", { variant: "success" });
                                const link = document.createElement("a");
                                link.download = props.fileName + "_export.csv";
                                link.href = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
                                link.click();
                            }
                        })
                        .catch(error => console.log(error))
                }
                sx={{
                    width: sm ? "50%" : "100%", marginBottom: "20px", "&:hover": {
                        backgroundColor: "#2C2C2C"
                    }
                }}>
                DOWNLOAD
                <Icon sx={{ marginLeft: "10px" }}>
                    <FileDownloadIcon />
                </Icon>
            </Button>
        </>
    );
}