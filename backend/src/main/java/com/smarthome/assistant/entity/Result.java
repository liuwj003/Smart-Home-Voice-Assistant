package com.smarthome.assistant.entity;

import lombok.Data;

@Data

public class Result {
    private String status;
    private String message;
    private Object data;

    public Result(String status, String message, Object data) {
        this.status = status;
        this.message = message;
        this.data = data;

    }
    public static Result success(Object data) {
        return new Result( "200","success",data);
    }
    public static Result error(Object data) {
        return new Result("400", "error", data);
    }
    public static Result success() {
        return new Result( "200","success",null);
    }
    public static Result error() {
        return new Result("400", "error", null );
    }


}
