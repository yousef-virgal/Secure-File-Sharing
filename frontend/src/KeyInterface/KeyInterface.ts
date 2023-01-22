
export interface PuplicKey {
    kty?: string;
    e?: string;
    n?: string;
}

export interface PrivateKey {
    d?: string;
    dp?: string;
    dq?: string;
    e?: string;
    kty?: string;
    n?: string;
    p?: string;
    q?: string;
    qi?: string;
}

export interface KeyPair {
    publicKey?: PuplicKey;
    privateKey?: PrivateKey;
}

export interface SymmetricKeys {
    IV?: string;
    AesKey?: string;
    DesKey?: string;
    TripleDesKey?: string;
    masterKey?: string;
}