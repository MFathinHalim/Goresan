export default function PostDetailSkeleton() {
    return (
        <div className='min-h-[calc(100vh-64px)] bg-white dark:bg-[#0B0B10] text-black dark:text-zinc-100 animate-pulse'>
            <div className='relative z-10 max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-0'>
                <div className='border rounded-md border-gray-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 overflow-hidden'>
                    {/* Skeleton Gambar Utama */}
                    <div className='w-full h-[450px] bg-gray-300 dark:bg-zinc-800' />

                    {/* Detail Post */}
                    <div className='p-4 md:p-6 bg-white dark:bg-zinc-900 flex flex-col gap-5'>
                        {/* Judul & Tombol Aksi */}
                        <div className='flex flex-wrap justify-between items-start gap-3'>
                            <div className='h-8 bg-gray-300 dark:bg-zinc-800 rounded-lg w-2/3' />
                            <div className='flex gap-2 shrink-0'>
                                <div className='h-8 w-14 bg-gray-200 dark:bg-zinc-800 rounded-full' />
                                <div className='h-8 w-20 bg-gray-200 dark:bg-zinc-800 rounded-full' />
                                <div className='h-8 w-20 bg-gray-200 dark:bg-zinc-800 rounded-full' />
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div className='space-y-2.5'>
                            <div className='h-4 bg-gray-200 dark:bg-zinc-800 rounded w-full' />
                            <div className='h-4 bg-gray-200 dark:bg-zinc-800 rounded w-5/6' />
                            <div className='h-4 bg-gray-200 dark:bg-zinc-800 rounded w-4/5' />
                        </div>

                        {/* Info User */}
                        <div className='flex items-center gap-3 pt-2'>
                            <div className='w-9 h-9 rounded-full bg-gray-300 dark:bg-zinc-800' />
                            <div className='h-5 bg-gray-300 dark:bg-zinc-800 rounded w-32' />
                        </div>

                        {/* Tags */}
                        <div className='flex gap-2 pt-2'>
                            <div className='h-7 w-16 bg-gray-200 dark:bg-zinc-800 rounded-full' />
                            <div className='h-7 w-24 bg-gray-200 dark:bg-zinc-800 rounded-full' />
                            <div className='h-7 w-14 bg-gray-200 dark:bg-zinc-800 rounded-full' />
                        </div>

                        <hr className='border-gray-200 dark:border-zinc-800 my-2' />

                        {/* Bagian Komentar */}
                        <div className='h-6 bg-gray-300 dark:bg-zinc-800 rounded w-40' />

                        {/* Input Komentar */}
                        <div className='flex gap-3 items-center'>
                            <div className='flex-1 h-16 bg-gray-100 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-800' />
                            <div className='h-16 w-16 rounded-full bg-gray-300 dark:bg-zinc-800 shrink-0' />
                        </div>

                        {/* List Komentar Minimalis */}
                        <div className='space-y-6 mt-4'>
                            {[1, 2].map((n) => (
                                <div key={n} className='flex gap-3'>
                                    <div className='w-12 h-12 rounded-full bg-gray-300 dark:bg-zinc-800 shrink-0' />
                                    <div className='flex-1 space-y-2'>
                                        <div className='flex gap-2 items-center'>
                                            <div className='h-4 bg-gray-300 dark:bg-zinc-800 rounded w-24' />
                                            <div className='h-3 bg-gray-200 dark:bg-zinc-800 rounded w-16' />
                                        </div>
                                        <div className='h-4 bg-gray-200 dark:bg-zinc-800 rounded w-full' />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
