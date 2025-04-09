import Head from 'next/head'
import React from 'react'
import { Container } from 'react-bootstrap';
import MainNavBar from './navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AppLayout({children}) {
  return (
    <html>
        <Head>
            <title>Project</title>
        </Head>
        <body>
            <MainNavBar/>
            <Container> {children} </Container>
        </body>
    </html>
  )
}
