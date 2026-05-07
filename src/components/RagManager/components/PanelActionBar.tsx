import React from 'react';
import { Stack, type StackProps } from '@mui/material';

interface PanelActionBarProps extends StackProps {
    children: React.ReactNode;
}

export function PanelActionBar({ children, sx, ...props }: PanelActionBarProps) {
    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                bgcolor: 'background.paper',
                boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
                borderRadius: 8,
                p: 0.75,
                border: '1px solid',
                borderColor: 'divider',
                alignItems: 'center',
                ...sx
            }}
            {...props}
        >
            {children}
        </Stack>
    );
}
