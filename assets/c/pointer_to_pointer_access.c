int main() {
    int base = 10;
    int other = 100;
    int *p = &base;
    int **pp = &p;
    **pp + other;
    **pp = **pp + 10;
}