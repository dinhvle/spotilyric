import useAuth from "./useAuth";

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  return (
    <div>
      <p>AccessToken: {accessToken}</p>
      <p>Code: {code}</p>
    </div>
  );
}
