import React, { useEffect, useRef, useState } from "react";
import {
    Grid,
    List,
    Pagination,
    Typography
} from "@mui/material";
import { LargerThanSm } from "../MediaQueries";
import { StyledTextButton } from "../styles";

export default function PaginationComp(props) {
    const sm = LargerThanSm();
    const topOfPagination = useRef(null);
    const [perPage, setPerPage] = useState(props.perPage > 0 ? props.perPage : props.datas.length);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(Math.ceil(props.datas.length / perPage));
    const [showAll, setShowAll] = useState(count === 1);

    const setDataFunc = value => {
        props.setData(props.datas.slice(perPage * (value - 1), perPage * value));
        setPage(value);
        if (props.setPageNr) props.setPageNr(value);
    };

    const scrollToTopOfPagination = _ => window.scrollTo({
        behavior: "smooth",
        top: topOfPagination.current.offsetTop - 128
    });

    useEffect(_ => {
        setDataFunc(1);
        setCount(Math.ceil(props.datas.length / perPage));
    }, [props.datas, perPage]);

    useEffect(_ => {
        setShowAll(false);
    }, [props.datas]);

    useEffect(_ => {
        setPerPage((props.perPage === 0 || showAll === true) ? props.datas.length : props.perPage);
    }, [showAll, props.perPage, props.datas]);

    return (
        <>
            <List ref={topOfPagination} sx={{ marginTop: 2 }}>
                {props.children}
            </List>
            {props.perPage > 0 && props.datas.length > props.perPage &&
                <Grid
                    container
                    justifyContent="space-between"
                    direction={sm ? (showAll === false ? "row" : "row-reverse") : "column"}
                    paddingLeft={2}
                    alignItems="center"
                >
                    {showAll === false ?
                        <>
                            <Grid item>
                                <Typography>Pagina {page}/{count}</Typography>
                            </Grid>
                            <Grid item>
                                <Pagination
                                    color="primary"
                                    count={count}
                                    page={page}
                                    onChange={(event, value) => {
                                        setDataFunc(value);
                                        scrollToTopOfPagination();
                                    }}
                                />
                            </Grid>
                            <Grid item>
                                <StyledTextButton
                                    size="small"
                                    onClick={_ => setShowAll(true)}>
                                    Vedi tutte
                                </StyledTextButton>
                            </Grid>
                        </> :
                        <Grid item>
                            <StyledTextButton
                                size="small"
                                onClick={_ => {
                                    setShowAll(false);
                                    setDataFunc(1);
                                    scrollToTopOfPagination();
                                }}>
                                Mostra meno
                            </StyledTextButton>
                        </Grid>
                    }
                </Grid>
            }
        </>
    );
}

PaginationComp.defaultProps = {
    perPage: 0,
}