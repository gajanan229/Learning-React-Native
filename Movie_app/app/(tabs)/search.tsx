import {Image, StyleSheet, Text, View, FlatList, ActivityIndicator} from 'react-native'
import {images} from "@/constants/images";
import MovieCard from "@/components/MovieCard";
import useFetch from "@/services/useFetch";
import {fetchMovies} from "@/services/api";
import {icons} from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import {useEffect, useState} from "react";
import {updateSearchCount} from "@/services/appwrite";
import { logMovieSearchToBackend } from '@/services/api';
import { fetchMovieDetails } from '@/services/api';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const {
        data: movies,
        loading,
        error,
        refetch: loadMovies,
        reset,
    } = useFetch(() => fetchMovies({
        query: searchQuery
    }))

    // State for the first movie from search results, to be used for logging
    const [firstMovieForLog, setFirstMovieForLog] = useState<Movie | null>(null);
    // State for the fetched details of the first movie
    const [detailedMovieForLog, setDetailedMovieForLog] = useState<MovieDetails | null>(null);
    // State to track if movie details are being fetched
    const [isFetchingDetailsForLog, setIsFetchingDetailsForLog] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim()) {
                await loadMovies();

            } else {
                reset();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Effect to identify the first movie and trigger detail fetching for logging
    useEffect(() => {
        if (movies && movies.length > 0 && movies[0]) {
            const currentFirstMovie = movies[0];
            setFirstMovieForLog(currentFirstMovie);

            if (currentFirstMovie.id) {
                setIsFetchingDetailsForLog(true);
                setDetailedMovieForLog(null); // Reset previous details
                fetchMovieDetails(currentFirstMovie.id.toString())
                    .then(details => {
                        setDetailedMovieForLog(details);
                    })
                    .catch(err => {
                        console.error("Failed to fetch movie details for logging:", err);
                        setDetailedMovieForLog(null); // Ensure it's null on error
                    })
                    .finally(() => {
                        setIsFetchingDetailsForLog(false);
                    });
            } else {
                // No valid ID for the first movie
                setFirstMovieForLog(null);
                setDetailedMovieForLog(null);
                setIsFetchingDetailsForLog(false);
            }
        } else {
            // No movies in the list
            setFirstMovieForLog(null);
            setDetailedMovieForLog(null);
            setIsFetchingDetailsForLog(false);
        }
    }, [movies]); // This effect runs when 'movies' array changes

    useEffect(() => {
        // Proceed only if we have a firstMovie, its ID, and we are not currently fetching details
        if (firstMovieForLog && firstMovieForLog.id && !isFetchingDetailsForLog) {
            if (detailedMovieForLog) {
                // Details were successfully fetched
                logMovieSearchToBackend({
                    tmdb_id: firstMovieForLog.id,
                    title: firstMovieForLog.title,
                    poster_path: firstMovieForLog.poster_path,
                    runtime_minutes: detailedMovieForLog.runtime || 0,
                    genres: detailedMovieForLog.genres ? detailedMovieForLog.genres.map(genre => genre.name) : []
                }).catch(logError => {
                    console.error('Failed to log movie search to backend (with details):', logError);
                });
            } else {
                // Details were not fetched (e.g., fetch failed, or no details available)
                // Log with default/fallback values for runtime and genres
                logMovieSearchToBackend({
                    tmdb_id: firstMovieForLog.id, // Assuming Movie interface has id as tmdb_id
                    title: firstMovieForLog.title,
                    poster_path: firstMovieForLog.poster_path,
                    runtime_minutes: 0,
                    genres: []
                }).catch(logError => {
                    console.error('Failed to log movie search to backend (no details/fallback):', logError);
                });
            }
        }
    }, [firstMovieForLog, detailedMovieForLog, isFetchingDetailsForLog]);

    return (
        <View className="flex-1 bg-primary">
            <Image source={images.bg} className="absolute w-full z-0" resizeMode={"cover"} />
            <FlatList
                data={movies}
                renderItem={({item}) => (
                    <MovieCard
                        {... item}
                    />
                )}
                keyExtractor={(item) => item.id}
                numColumns={3}
                columnWrapperStyle={{
                    justifyContent: 'center',
                    gap: 16,
                    marginVertical: 16
                }}
                className="px-5"
                contentContainerStyle={{paddingBottom: 100}}
                ListHeaderComponent={
                    <>
                        <View className="w-full flex-row justify-center mt-20">
                            <Image source={icons.logo} className="w-12 h-10"/>
                        </View>
                        <View className="my-5">
                            <SearchBar
                                placeholder="Search movies ..."
                                value={searchQuery}
                                onChangeText={(text: string) => setSearchQuery(text)}
                            />
                        </View>

                        {loading && (
                            <ActivityIndicator size="large" color="#0000ff" className="my-3"/>
                        )}
                        {error && (
                            <Text className="text-red-500 px-5 my-3">
                                Error: {error.message}
                            </Text>
                        )}
                        {
                            !error && !loading && searchQuery.trim()
                            && movies?.length > 0 && (
                                <Text className="text-xl text-white font-bold">
                                    Search results for {' '}
                                    <Text className="text-accent">{searchQuery}</Text>
                                </Text>
                            )
                        }
                    </>
                }
                ListEmptyComponent={
                    !loading && !error ? (
                        <View className="mt-5 px-5">
                            <Text className="text-center text-gray-500">
                                {searchQuery.trim() ? 'no movies found' : 'search for a movie'}
                            </Text>
                        </View>
                    ) : null
                }
            />
            <Text>Search</Text>
        </View>
    )
}
export default Search
const styles = StyleSheet.create({})
