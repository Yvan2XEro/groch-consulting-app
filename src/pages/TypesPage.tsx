import {
  Button,
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  TextInput,
} from "@tremor/react";
import { IoEye, IoTrashBinOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { ProductsType, User } from "../types";
import HeaderPageContent from "../components/HeaderPageContent";
import { useState } from "react";
import { useQuery, useMutation } from "react-query";
import { allTypes, createType, destroyType, updateType } from "../api";
import ModaleLayout from "../components/ModaleLayout";
import { useAuth } from "../context";
import Loader from "@/components/Loader";

export default function TypesPage() {
  const {
    isLoading,
    data: types,
    refetch,
  } = useQuery<ProductsType[]>(["types"], allTypes);

  const [searchKey, setsearchKey] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<ProductsType | null>(null);
  const { isAdmin } = useAuth();

  const deleteMutation = useMutation((data) => destroyType(data), {
    onSuccess: () => refetch(),
  });
  async function deleteType(id: any) {
    if (window.confirm("Etes vous sure de cette action?"))
      await deleteMutation.mutateAsync(id);
  }

  function handleEditModale(type: ProductsType) {
    setSelected(type);
    setIsOpen(true);
  }
  if (isLoading) return <Loader />;

  return (
    <div>
      <Card>
        <HeaderPageContent
          title="Liste des types de produits"
          value={searchKey}
          onChange={setsearchKey}
          onAdd={() => setIsOpen(true)}
          buttonLabel="Nouveau type"
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell># ID</TableHeaderCell>
              <TableHeaderCell>Nom</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
              <TableHeaderCell>Nombre de produits</TableHeaderCell>
              {isAdmin && (
                <>
                  <TableHeaderCell>Modifier</TableHeaderCell>
                  <TableHeaderCell>Supprimer</TableHeaderCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {types?.map((p, i) => (
              <TableRow key={i}>
                <TableCell>#{p.id}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.description}</TableCell>
                <TableCell>{p.products?.length || 0}</TableCell>
                {isAdmin && (
                  <>
                    <TableCell>
                      <Button onClick={() => handleEditModale(p)} color="pink">
                        Modif
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        color="fuchsia"
                        onClick={() => deleteType(p.id)}
                        disabled={p.products && p.products?.length > 0}
                        icon={IoTrashBinOutline}
                      >
                        Sup
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <ModaleLayout
        closeModal={() => {
          setSelected(null);
          setIsOpen(false);
        }}
        isOpen={isOpen}
        title={!selected ? "Nouveau type" : "Modifier le type"}
      >
        <TypeForm
          type={selected}
          onSuccess={() => {
            setSelected(null);
            refetch();
            setIsOpen(false);
          }}
        />
      </ModaleLayout>
    </div>
  );
}

type TypeFormProps = {
  type: ProductsType | null;
  onSuccess: () => void;
};
function TypeForm({ type, onSuccess }: TypeFormProps) {
  const [name, setName] = useState(type?.name || "");
  const [description, setDescription] = useState(type?.description || "");
  const spentMutation = useMutation(
    (data) => {
      if (!type) return createType(data);
      return updateType(type.id, data);
    },
    {
      onSuccess,
    }
  );
  async function handleSave(e: any) {
    e.preventDefault();
    await spentMutation.mutateAsync({ name, description } as any);
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSave}>
      <label>
        <span className="block">Nom du type:</span>
        <TextInput
          value={name}
          onChange={({ target }) => setName(target.value)}
          placeholder="Ex: verres médicaux, Médicamant"
        />
      </label>
      <label>
        <span className="block">Description:</span>
        <TextInput
          value={description}
          onChange={({ target }) => setDescription(target.value)}
          placeholder=""
        />
      </label>
      <Button loading={spentMutation.isLoading}>Enrégistrer</Button>
    </form>
  );
}
