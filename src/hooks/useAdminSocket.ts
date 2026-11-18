import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import type { Order } from '../types';

const WS_URL = `${(import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/^http/, 'ws')}/ws`;
const getToken = () => localStorage.getItem('admin_token');

interface Options {
    onNewOrder?: (order: Order) => void;
}

export function useAdminSocket({ onNewOrder }: Options) {
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        const token = getToken();
        if (!token) return;

        const client = new Client({
            brokerURL: WS_URL,
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 3000,
            onConnect: () => {
                client.subscribe('/topic/admin/orders', (msg) => {
                    try { onNewOrder?.(JSON.parse(msg.body)); }
                    catch { /* ignore */ }
                });
            },
        });

        client.activate();
        clientRef.current = client;

        return () => { client.deactivate(); clientRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
