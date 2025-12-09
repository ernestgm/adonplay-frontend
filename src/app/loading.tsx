export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mb-4"></div>
            <h2 className="text-gray-600 text-lg">Loading...</h2>
        </div>
    );
}
