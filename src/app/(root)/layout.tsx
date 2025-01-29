//we can also wrap it in main layout by doing that it will be accessible in whole app but we don't need this
import StreamClientProvider from "@/components/providers/StreamClientProvider";

function Layout({ children }: { children: React.ReactNode }) {
    return <StreamClientProvider>{children}</StreamClientProvider>;
}
export default Layout;