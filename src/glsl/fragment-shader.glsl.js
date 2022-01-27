export default `#version 300 es
precision mediump float;

in vec4 vColor;
uniform vec2 uInverseTextureSize;
out vec4 fragColor;
uniform int uWidth;
uniform int uHeight;

const float PI = 3.141592653589793238462643383;
const uint MATRIX_A = 0x9908B0DFu;
const uint UPPER_MASK = 0x80000000u;
const uint LOWER_MASK = 0x7FFFFFFFu;
const uint FULL_MASK = 0xFFFFFFFFu;
const int N = 624;
const int M = 397;
const int KEY_LENGTH = 4;

uint mt[N];
int mti = N+1;

void initSeedMT(uint s) {
    mt[0]= s;
    for (int i=1; i<N; i++) {
         mt[i] = (1812433253u * (mt[i-1]^(mt[i-1]>>30)) + uint(i));
    }
}

void initArrayMT(uint initKey[KEY_LENGTH]) {
    int i, j, k;
    initSeedMT(19650218u);
    i = 1;
    j = 0;
    k = (N>KEY_LENGTH ? N : KEY_LENGTH);

    for (; k>0; k--) {
        mt[i] = (mt[i] ^ ((mt[i-1] ^ (mt[i-1] >> 30)) * 1664525u)) + initKey[j] + uint(j);
        i++;
        j++;
        if (i>=N) {
            mt[0] = mt[N-1];
            i = 1;
        }
        if (j>=KEY_LENGTH) {
            j = 0;
        }
    }
    for (k=N-1; k>0; k--) {
        mt[i] = (mt[i] ^ ((mt[i-1] ^ (mt[i-1] >> 30)) * 1566083941u)) - uint(i);
        i++;
        if (i>=N) {
            mt[0] = mt[N-1];
            i = 1;
        }
    }
    mt[0] = 0x80000000u;
}


uint uintMT(void) {
    uint y;
    uint mag01[2];
    mag01[0] = 0x0u;
    mag01[1] = MATRIX_A;

    if (mti >= N) {
        int kk;
        for (kk=0;kk<N-M;kk++) {
            y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
            mt[kk] = mt[kk+M] ^ (y >> 1u) ^ mag01[int(y&0x1u)];
        }
        for (;kk<N-1;kk++) {
            y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
            mt[kk] = mt[kk+(M-N)] ^ (y >> 1u) ^ mag01[int(y&0x1u)];
        }
        y = (mt[N-1]&UPPER_MASK)|(mt[0]&LOWER_MASK);
        mt[N-1] = mt[M-1] ^ (y >> 1u) ^ mag01[int(y&0x1u)];
        mti = 0;
    }
    y = mt[mti++];

    // Tempering
    y ^= (y >> 11);
    y ^= (y << 7) & 0x9D2C5680u;
    y ^= (y << 15) & 0xEFC60000u;
    y ^= (y >> 18);

    return y;
}

float floatMT(void) {
    return float(uintMT())*(1.0/4294967295.0);
}

vec4 intToVec4(int num) {
    int rIntValue = num & 0x000000FF;
    int gIntValue = (num & 0x0000FF00) >> 8;
    int bIntValue = (num & 0x00FF0000) >> 16;
    int aIntValue = (num & 0xFF000000) >> 24;
    vec4 numColor = vec4(float(rIntValue)/255.0, float(gIntValue)/255.0, float(bIntValue)/255.0, float(aIntValue)/255.0); 
    return numColor; 
} 

vec4 uintToVec4(uint num) {
    uint rIntValue = num & 0x000000FFu;
    uint gIntValue = (num & 0x0000FF00u) >> 8;
    uint bIntValue = (num & 0x00FF0000u) >> 16;
    uint aIntValue = (num & 0xFF000000u) >> 24;
    vec4 numColor = vec4(float(rIntValue)/255.0, float(gIntValue)/255.0, float(bIntValue)/255.0, float(aIntValue)/255.0); 
    return numColor;
}

vec4 floatToVec4(float val) {
    uint conv = floatBitsToUint(val);
    return uintToVec4(conv);
}

void main(void) {
    uint seed[4];
    seed[0] = 0x123u;
    seed[1] = 0x234u;
    seed[2] = 0x345u;
    seed[3] = 0x456u;
    initArrayMT(seed);
    int pix = uWidth*int(gl_FragCoord.y) + int(gl_FragCoord.x) + 1;
    uint uintRand;
    float floatRand;

    if (pix < 1000) {
        for (int i=0; i<pix; i++) {
            uintRand = uintMT();
        }
        fragColor = uintToVec4(uintRand);
    }
    else {
        for (int i=0; i<pix; i++) {
            floatRand = floatMT();
        }
        fragColor = floatToVec4(floatRand);
    }
}`