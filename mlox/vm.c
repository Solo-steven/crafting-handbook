#include "common.c"

typedef struct {
    uint8_t *instructions;
    uint32_t len;
    uint32_t cap;
} Chunk ;

typedef struct Frame {
    
};

typedef struct {

} Symbol;

typedef enum {
    Number,
    Object,
    Bool,
    Nil
} ValueType;

typedef struct {
    
} Value;
