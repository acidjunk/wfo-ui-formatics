import React, {useEffect, useState} from 'react';
import NoSSR from 'react-no-ssr';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClientConfig } from 'react-query/types/core/types';

import { SessionProvider } from 'next-auth/react';
import { NextAdapter } from 'next-query-params';
import App, { AppContext, AppInitialProps, AppProps } from 'next/app';
import Head from 'next/head';
import { QueryParamProvider } from 'use-query-params';

import {EuiProvider, EuiThemeColorMode} from '@elastic/eui';
import {
    ApiClientContextProvider,
    ConfirmationDialogContextWrapper,
    OrchestratorConfig,
    OrchestratorConfigProvider,
    ToastsContextProvider,
    ToastsList,
    WfoAuth,
    WfoPageTemplate,
} from '@orchestrator-ui/orchestrator-ui-components';

import { getAppLogo } from '@/components/AppLogo/AppLogo';
import { getInitialOrchestratorConfig } from '@/configuration';
import { TranslationsProvider } from '@/translations/translationsProvider';
import {defaultOrchestratorTheme} from "@/theme/defaultOrchestratorTheme";

type AppOwnProps = { orchestratorConfig: OrchestratorConfig };

const queryClientConfig: QueryClientConfig = {
    defaultOptions: {
        queries: {
            cacheTime: 60 * 60 * 1000,
            refetchOnWindowFocus: true,
            keepPreviousData: true,
        },
    },
};

function CustomApp({
    Component,
    pageProps,
    orchestratorConfig,
}: AppProps & AppOwnProps) {
    const [queryClient] = useState(() => new QueryClient(queryClientConfig));
    const [themeMode, setThemeMode] = useState<EuiThemeColorMode>('light');

    const handleThemeSwitch = (newThemeMode: EuiThemeColorMode) => {
        setThemeMode(newThemeMode);
        localStorage.setItem('themeMode', newThemeMode);
    };

    useEffect(() => {
        // Initialize theme mode from localStorage or set it to 'light' if not present
        if (!localStorage.getItem('themeMode')) {
            handleThemeSwitch('light');
        }
    }, []);

    // const getMenuItems = (
    //     defaultMenuItems: EuiSideNavItemType<object>[]
    // ): EuiSideNavItemType<object>[] => {
    //     const updatedMenuItems = defaultMenuItems.map(item => {
    //         if (item.id === '4') {
    //             return {
    //                 name: 'Emails',
    //                 id: '4',
    //                 isSelected: router.pathname === PATH_SUBSCRIPTIONS,
    //                 href: PATH_SUBSCRIPTIONS,
    //                 onClick: (e: { preventDefault: () => void; }) => {
    //                     e.preventDefault();
    //                     router.push(PATH_SUBSCRIPTIONS);
    //                 },
    //             };
    //         } else {
    //             return item; // Keep the other items unchanged
    //         }
    //     });
    //
    //     return updatedMenuItems;
    // };
    //


    return (
        <OrchestratorConfigProvider
            initialOrchestratorConfig={orchestratorConfig}
        >
            <SessionProvider session={pageProps.session}>
                <WfoAuth>
                    <NoSSR>
                        <EuiProvider
                            colorMode={themeMode}
                            modify={defaultOrchestratorTheme}
                        >
                            <ApiClientContextProvider>
                                <QueryClientProvider
                                    client={queryClient}
                                    contextSharing={true}
                                >
                                    <TranslationsProvider>
                                        <Head>
                                            <link
                                                rel="stylesheet"
                                                href={`/styles/eui_theme_${themeMode}.min.css`}
                                            />
                                            <title>
                                                Email workflows
                                            </title>
                                        </Head>
                                        <main className="app">
                                            <ToastsContextProvider>
                                                <ConfirmationDialogContextWrapper>
                                                    <WfoPageTemplate
                                                        getAppLogo={getAppLogo}
                                                        // overrideMenuItems={
                                                        //     getMenuItems
                                                        // }
                                                        themeSwitch={
                                                            handleThemeSwitch
                                                        }
                                                    >
                                                        <QueryParamProvider
                                                            adapter={
                                                                NextAdapter
                                                            }
                                                            options={{
                                                                removeDefaultsFromUrl:
                                                                    false,
                                                                enableBatching:
                                                                    true,
                                                            }}
                                                        >
                                                            <Component
                                                                {...pageProps}
                                                            />
                                                        </QueryParamProvider>
                                                    </WfoPageTemplate>
                                                    <ToastsList />
                                                </ConfirmationDialogContextWrapper>
                                            </ToastsContextProvider>
                                            <ReactQueryDevtools
                                                initialIsOpen={false}
                                            />
                                        </main>
                                    </TranslationsProvider>
                                </QueryClientProvider>
                            </ApiClientContextProvider>
                        </EuiProvider>
                    </NoSSR>
                </WfoAuth>
            </SessionProvider>
        </OrchestratorConfigProvider>
    );
}

CustomApp.getInitialProps = async (
    context: AppContext,
): Promise<AppOwnProps & AppInitialProps> => {
    const ctx = await App.getInitialProps(context);

    return {
        ...ctx,
        orchestratorConfig: getInitialOrchestratorConfig(),
    };
};

export default CustomApp;
