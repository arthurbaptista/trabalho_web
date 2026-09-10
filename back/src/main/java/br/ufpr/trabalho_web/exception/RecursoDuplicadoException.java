package br.ufpr.trabalho_web.exception;

public class RecursoDuplicadoException extends RuntimeException {
    public RecursoDuplicadoException(String message) {
        super(message);
    }
}