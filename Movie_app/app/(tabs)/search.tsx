import {Image, StyleSheet, Text, View, FlatList, ActivityIndicator} from 'react-native'
import {images} from "@/constants/images";
import MovieCard from "@/components/MovieCard";
import useFetch from "@/services/useFetch";
import {fetchMovies} from "@/services/api";
import {icons} from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import {useEffect, useState} from "react";
import {updateSearchCount} from "@/services/appwrite";

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

    useEffect(() => {
        // Call updateSearchCount only if there are results
        if (movies?.length! > 0 && movies?.[0]) {
            updateSearchCount(searchQuery, movies[0]);
        }
    }, [movies]);

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
