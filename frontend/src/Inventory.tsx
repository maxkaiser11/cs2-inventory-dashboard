import { useEffect, useState } from "react";

type Item = {
  assetid: string;
  name: string;
  icon_url?: string;
}



const Inventory = () => {

  

  const url: string = 'http://localhost:3000/user/inventory/76561198298708643';

  const [items, setItems ] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { signal: controller.signal})
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
      })
    .then((data) => setItems(data))
    .catch((err) => {
        if (err.name !== 'AbortError') setError(`HTTP ${res.status}`);
      })
    .finally(() => setLoading(false));

    return () => controller.abort();
  },[url]);


if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (items.length === 0) return <p>Inventory is empty.</p>;

  return (
    <div>
      <ul>
      {items.map((item) => (
        <li key={item.assetid}>
          {item.icon_url && (
            <img
              src={`https://community.cloudflare.steamstatic.com/economy/image/${item.icon_url}`}
              alt={item.name}
              width={64}
            />
          )}
          {item.name}
        </li>
      ))}
    </ul>
    </div>
  )
}

export default Inventory
