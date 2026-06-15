export default function ProfileSkeleton() {
    return (
        <div className='min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white animate-pulse'>
            {/* HEADER SKELETON */}
            <div className='flex flex-col sm:flex-row gap-6 lg:gap-10 px-6 py-8 justify-center items-center sm:items-start'>
                {/* Foto Profil */}
                <div className='w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gray-200 dark:bg-zinc-800 shrink-0' />

                <div className='flex flex-col items-center sm:items-start text-center sm:text-left flex-1 w-full'>
                    {/* Username & Tombol */}
                    <div className='flex items-center gap-3'>
                        <div className='h-8 bg-gray-300 dark:bg-zinc-700 rounded-lg w-40' />
                        <div className='h-5 w-5 bg-gray-200 dark:bg-zinc-800 rounded' />
                        <div className='h-5 w-5 bg-gray-200 dark:bg-zinc-800 rounded' />
                    </div>

                    {/* Email */}
                    <div className='h-4 bg-gray-200 dark:bg-zinc-800 rounded w-48 mt-2' />

                    {/* Deskripsi / Bio */}
                    <div className='space-y-2 mt-4 w-full max-w-sm lg:w-[30vw]'>
                        <div className='h-3 bg-gray-200 dark:bg-zinc-800 rounded w-full' />
                        <div className='h-3 bg-gray-200 dark:bg-zinc-800 rounded w-5/6' />
                    </div>

                    {/* info Posts & Likes */}
                    <div className='flex gap-6 mt-5'>
                        <div className='h-4 bg-gray-300 dark:bg-zinc-700 rounded w-16' />
                        <div className='h-4 bg-gray-300 dark:bg-zinc-700 rounded w-16' />
                    </div>
                </div>
            </div>

            {/* TABS SKELETON */}
            <div className='flex justify-center gap-8 border-b border-zinc-200 dark:border-zinc-800 mx-6 pb-3'>
                <div className='h-5 bg-gray-300 dark:bg-zinc-700 rounded w-14' />
                <div className='h-5 bg-gray-200 dark:bg-zinc-800 rounded w-14' />
            </div>

            {/* POSTS GRID SKELETON */}
            <div className='px-4 py-6'>
                <div className='columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3'>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <div
                            key={n}
                            className='break-inside-avoid bg-gray-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800/60 overflow-hidden'
                            style={{ height: n % 2 === 0 ? "260px" : "320px" }} // Variasi tinggi agar mirip layout masonry (Pinterest style)
                        >
                            <div className='w-full h-full bg-gray-200 dark:bg-zinc-800/50' />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
