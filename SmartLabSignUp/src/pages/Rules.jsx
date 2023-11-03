import { Box, Typography } from "@mui/material";
import React from "react";

export default function Rules() {
    return (
        <>
            <Box m={5} style={{ maxWidth: "100%" }}>
                <Typography variant="infoText" style={{ maxWidth: "100%", overflowWrap: "break-word" }}>
                    <b>OBBLIGHI E RESPONSABILITÀ DELL’UTILIZZATORE</b>
                    <br />
                    <br />
                    L’Utilizzatore si impegna a svolgere attività lecite all’interno del luogo dell’Innovation Lab e si impegna a mantenere rapporti collaborativi con il Gestore (Federazione dei Comuni del Camposampierese) e gli altri professionisti e utenti presenti.
                    <br />
                    <br />
                    L’Utilizzatore s’impegna a non lasciare nella postazione denaro, computer portatili o altri oggetti di valore, sollevando espressamente il Gestore da ogni responsabilità nel caso di furto, scasso, incendio, danni derivanti da forza maggiore, rinunciando ad avanzare qualsiasi pretesa o richiesta di risarcimento danni.
                    <br />
                    <br />
                    Le parti, in relazione ai beni messi al servizio dell’Utilizzatore, escludono l’obbligo di custodia a carico del Gestore. Dal momento dell’eventuale consegna delle chiavi/badge o altro mezzo di accesso individuale, ogni onere manutentivo, di custodia o quant’altro necessario per la tutela e la conservazione del bene sarà a carico dell’Utilizzatore.
                    <br />
                    <br />
                    L’Utilizzatore è responsabile in via esclusiva in caso di danni arrecati alle attrezzature, alle persone, ai locali, all’immobile, dall’attività dello stesso esercitata e/o per atti al medesimo imputabili, ovvero imputabili ai propri ospiti o collaboratori.
                    <br />
                    <br />
                    L’Utilizzatore si impegna, pertanto, a manlevare e tenere indenne il Gestore da qualsiasi responsabilità e richiesta risarcitoria derivante dall’utilizzo della prestazione e/o della connessione internet, in particolare se scaturente da un uso improprio e/o illegale.
                    <br />
                    <br />
                    Nel momento di cessazione del servizio prenotato, per scadenza o altre cause, l’Utilizzatore si impegna a liberare la postazione utilizzata lasciando tutte le attrezzature presenti al principio.
                </Typography>
            </Box>
        </>
    );
}