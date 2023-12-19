int main() {
    int a = 10;
    {
        int a = 100;
        a = a + 10;
    }
    a = a + 1;
    return 0;
}