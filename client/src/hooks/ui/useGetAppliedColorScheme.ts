import { useMantineColorScheme } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";

export function useGetAppliedColorScheme() {
    const colorScheme = useColorScheme();
    const { colorScheme: mantineColorScheme } = useMantineColorScheme();

    return mantineColorScheme === 'auto' ? colorScheme : mantineColorScheme;

}