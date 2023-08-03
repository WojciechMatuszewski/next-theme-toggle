import { GetServerSideProps } from "next"

export default function Page() {
    return <div>SSR Page</div>
}

export const getServerSideProps: GetServerSideProps = async () => {
    return {
        props: {}
    }
}
