import axios from "axios";
import { useEffect, useState } from "react";

export default function useAuth(code) {
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();

  useEffect(() => {
    axios
      .post("https://infinite-harbor-55761.herokuapp.com/api/login", {
        code,
      })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        setExpiresIn(res.data.expiresIn);
        window.history.pushState({}, null, "/");
      })
      .catch(() => {
        window.location = "https://infinite-harbor-55761.herokuapp.com/";
      });
  }, [code]);

  useEffect(() => {
    if (!refreshToken || !expiresIn) return;
    const interval = setInterval(() => {
      axios
        .post("https://infinite-harbor-55761.herokuapp.com/api/refresh", {
          refreshToken,
        })
        .then((res) => {
          setAccessToken(res.data.accessToken);
          setExpiresIn(res.data.expiresIn);
        })
        .catch(() => {
          window.location = "https://infinite-harbor-55761.herokuapp.com/";
        });
    }, (expiresIn - 60) * 1000); // refresh token 60 seconds before expire

    return () => clearInterval(interval);
  }, [refreshToken, expiresIn]);

  return accessToken;
}
