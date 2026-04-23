import {postApi} from "../api/post.ts";
import type {ListReq, ListResp} from "../types/api/post";
import {useInfiniteQuery} from "@tanstack/react-query";
import {useEffect, useState} from "react";

async function queryFn(pageParam: number, req: ListReq): Promise<ListResp> {
    return postApi.List({
        ...req,
        page: pageParam,
        pageSize: 10
    })
}

export const postUseInfiniteQuery = (req: ListReq) => {
    return useInfiniteQuery({
        queryKey: ["post", req.postType, req.sort],
        queryFn: ({pageParam}) => {
            return queryFn(pageParam, req)
        },
        initialPageParam: 1,
        getNextPageParam: (listResp, allPages) => {
            return allPages.length * 10 < listResp.total
                ? allPages.length + 1
                : undefined
        },
    })
}

export function useIntersectionObserver(
    ref: React.RefObject<HTMLElement | null>,
    onIntersect: () => void,
    enabled: boolean
) {
    useEffect(() => {
        if (!ref.current || !enabled) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onIntersect();
                }
            },
            {threshold: 0} // 哨兵元素刚露出就触发
        );

        observer.observe(ref.current);

        return () => observer.disconnect();
    }, [ref, onIntersect, enabled]);
}

export function useDelayedLoading(isLoading: boolean, delay = 200) {
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => setShowLoading(true), delay);
            return () => clearTimeout(timer);
        }
        setShowLoading(false);
    }, [isLoading, delay]);

    return showLoading;
}